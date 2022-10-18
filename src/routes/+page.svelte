<script lang="ts">
	import { onMount } from 'svelte'
	import { blur } from 'svelte/transition'

	/*
		Types
	*/

	type Game = 'waiting for input' | 'in progress' | 'game over'
	type Word = string

	/* 
		Game state
	*/

	let game: Game = 'waiting for input'
	let seconds = 30
	let typedLetter = ''

	let words: Word[] = []
	let wordIndex = 0
	let letterIndex = 0
	let correctLetters = 0
	let wordsPerMinute = 0
	let accuracy = 0
	let toggleReset = false

	let wordsEl: HTMLDivElement
	let inputEl: HTMLInputElement
	let caretEl: HTMLDivElement

	/*
		Listen for key press
	*/

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			event.preventDefault()

			if (game === 'in progress') {
				nextWord()
			}
		}

		if (game === 'waiting for input') {
			startGame()
		}
	}

	function nextWord() {
		const isNotFirstLetter = letterIndex !== 0
		const isOneLetterWord = words[wordIndex].length === 1

		if (isNotFirstLetter || isOneLetterWord) {
			wordIndex += 1
			letterIndex = 0
			increaseScore()
			moveCaret()
		}
	}

	/*
		Start game
	*/

	function startGame() {
		setGameState('in progress')
		setGameTimer()
	}

	function setGameState(state: Game) {
		game = state
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

	/*
		Evaluate user input
	*/

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

	/*
		Game over
	*/

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

	/*
		Game reset
	*/

	function resetGame() {
		setGameState('waiting for input')
		getWords(100)
		focusInput()
		seconds = 30
		typedLetter = ''
		wordIndex = 0
		letterIndex = 0
		correctLetters = 0
		wordsPerMinute = 0
		accuracy = 0

		toggleReset = !toggleReset
	}

	/*
		Helpers
	*/

	async function getWords(limit: number) {
		const response = await fetch(`/api/words?limit=${limit}`)
		words = await response.json()
	}

	function getTotalLetters(words: Word[]) {
		return words.reduce((count, word) => count + word.length, 0)
	}

	function currentWordEl() {
		return wordsEl.children[wordIndex] as HTMLSpanElement
	}

	function currentLetterEl() {
		return wordsEl.children[wordIndex].children[letterIndex] as HTMLSpanElement
	}

	function focusInput() {
		inputEl.focus()
	}

	/* get words and focus input on mount */

	onMount(async () => {
		getWords(100)
		focusInput()
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

		{#key toggleReset}
			<div in:blur|local bind:this={wordsEl} class="words">
				{#each words as word (word)}
					<span class="word">
						{#each word as letter}
							<span class="letter">{letter}</span>
						{/each}
					</span>
				{/each}

				<div bind:this={caretEl} class="caret" />
			</div>
		{/key}

		<div class="reset">
			<button on:click={resetGame} aria-label="reset">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					stroke-width="1.5"
					stroke="currentColor"
					fill="none"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
					/>
				</svg>
			</button>
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

		.reset {
			width: 100%;
			display: grid;
			justify-content: center;
			margin-top: 2rem;

			button {
				color: inherit;
				background: none;
				border: none;
				opacity: 0.4;
				transition: all 0.3s ease;

				&:hover {
					cursor: pointer;
					opacity: 1;
				}
			}
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
