<script lang="ts">
	import { onMount } from 'svelte'
	import { blur } from 'svelte/transition'

	type Game = 'waiting for input' | 'in progress' | 'game over'
	type Word = string

	let game: Game = 'waiting for input'
	let seconds = 30
	let typedLetter = ''

	let words: Word[] = []
	let wordIndex = 0
	let letterIndex = 0
	let correctLetters = 0
	let wordsPerMinute = 0
	let accuracy = 0

	let wordsEl: HTMLDivElement
	let inputEl: HTMLInputElement
	let caretEl: HTMLDivElement

	/* listen for key press */

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			event.preventDefault()
			nextWord()
			increaseScore()
		}

		if (game === 'waiting for input') {
			startGame()
		}
	}

	function nextWord() {
		wordIndex += 1
		letterIndex = 0
		moveCaret()
	}

	/* start game */

	function startGame() {
		setGameState('in progress')
		setGameValues()
		setGameTimer()
	}

	function setGameState(state: Game) {
		game = state
	}

	function setGameValues() {
		wordIndex = 0
		letterIndex = 0
		typedLetter = ''
	}

	function setGameTimer() {
		function gameTimer() {
			if (seconds > 0) {
				seconds -= 1
			}

			if (seconds === 0) {
				clearInterval(interval)
				setGameState('game over')
				getResults()
			}
		}

		const interval = setInterval(gameTimer, 1000)
	}

	/* evaluate user input */

	function updateGameState() {
		checkLetter()
		nextLetter()
		updateLine()
		resetLetter()
		moveCaret()
	}

	function checkLetter() {
		const currentLetter = words[wordIndex][letterIndex]
		const letterEl = currentLetterEl()

		if (typedLetter === currentLetter) {
			letterEl.classList.add('correct')
			increaseScore()
		}

		if (typedLetter !== currentLetter) {
			letterEl.classList.add('incorrect')
		}
	}

	function increaseScore() {
		correctLetters += 1
	}

	function nextLetter() {
		const currentWordLength = words[wordIndex].length - 1

		if (letterIndex < currentWordLength) {
			letterIndex += 1
		}
	}

	function updateLine() {
		const wordEl = currentWordEl()
		const wordPosition = wordEl.getBoundingClientRect()
		const thresholdY = 402

		if (wordPosition.y > thresholdY) {
			wordEl.scrollIntoView({ block: 'center' })
		}
	}

	function resetLetter() {
		typedLetter = ''
	}

	function moveCaret() {
		const { offsetTop, offsetLeft, offsetWidth } = currentLetterEl()
		const currentWordLength = words[wordIndex].length - 1
		const caretOffsetTop = 4

		if (letterIndex !== currentWordLength) {
			caretEl.style.top = `${offsetTop + caretOffsetTop}px`
			caretEl.style.left = `${offsetLeft}px`
		}

		if (letterIndex === currentWordLength) {
			caretEl.style.left = `${offsetLeft + offsetWidth}px`
		}
	}

	/* game over */

	// https://www.speedtypingonline.com/typing-equations
	// words per minute = (correct / 5) / time
	// accuracy = (correct / total) * 100%

	function getWordsPerMinute() {
		const word = 5
		const minutes = 0.5
		return Math.floor(correctLetters / word / minutes)
	}

	function getAccuracy() {
		const totalLetters = getTotalLetters(words)
		return Math.floor((correctLetters / totalLetters) * 100)
	}

	function getResults() {
		wordsPerMinute = getWordsPerMinute()
		accuracy = getAccuracy()
	}

	/* helpers */

	function currentWordEl() {
		return wordsEl.children[wordIndex] as HTMLSpanElement
	}

	function currentLetterEl() {
		return wordsEl.children[wordIndex].children[letterIndex] as HTMLSpanElement
	}

	async function getWords(limit: number) {
		const response = await fetch(`/api/words?limit=${limit}`)
		words = await response.json()
	}

	function getTotalLetters(words: Word[]) {
		return words.reduce((count, word) => count + word.length, 0)
	}

	onMount(async () => {
		getWords(100)
		inputEl.focus()
	})
</script>

{#if game !== 'game over'}
	<div class="game" data-state={game}>
		<input
			bind:this={inputEl}
			bind:value={typedLetter}
			on:input={updateGameState}
			on:keydown={handleKeydown}
			class="input"
			type="text"
		/>

		<div class="time">{seconds}</div>

		<div bind:this={wordsEl} class="words">
			{#each words as word}
				<span class="word">
					{#each word as letter}
						<span class="letter">{letter}</span>
					{/each}
				</span>
			{/each}

			<div bind:this={caretEl} class="caret" />
		</div>
	</div>
{/if}

{#if game === 'game over'}
	<div in:blur class="results">
		<div>
			<p class="title">wpm</p>
			<p class="score">{wordsPerMinute}</p>
		</div>

		<div>
			<p class="title">accuracy</p>
			<p class="score">{accuracy}%</p>
		</div>
	</div>
{/if}

<style lang="scss">
	.results {
		font-family: 'Roboto Mono', monospace;

		.title {
			font-size: 2rem;
			color: hsl(220 20% 80%);
		}

		.score {
			font-size: 4rem;
			color: tomato;
		}
	}

	.game {
		position: relative;

		.input {
			position: absolute;
			opacity: 0;
		}

		.time {
			position: absolute;
			top: -48px;
			font-family: 'Roboto Mono', monospace;
			font-size: 1.5rem;
			color: tomato;
			opacity: 0;
			transition: all 0.3s ease;
		}

		&[data-state='in progress'] .time {
			opacity: 1;
		}

		&[data-state='in progress'] .caret {
			animation: none;
		}
	}

	.words {
		--line-height: 1em;
		--lines: 3;

		width: 100%;
		max-height: calc(var(--line-height) * var(--lines) * 1.4);
		display: flex;
		flex-wrap: wrap;
		gap: 0.6em;
		position: relative;
		font-family: 'Roboto Mono', monospace;
		font-size: 1.5rem;
		line-height: var(--line-height);
		overflow: hidden;
		user-select: none;

		.letter {
			opacity: 0.4;
			transition: all 0.3s ease;

			&:global(.correct) {
				opacity: 0.8;
			}

			&:global(.incorrect) {
				color: tomato;
				opacity: 1;
			}
		}

		.caret {
			position: absolute;
			height: 1.8rem;
			top: 0;
			border-right: 1px solid tomato;
			animation: caret 1s infinite;
			transition: all 0.2s ease;
		}
	}

	@keyframes caret {
		0%,
		to {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}
</style>
