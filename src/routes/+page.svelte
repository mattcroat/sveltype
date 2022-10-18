<script lang="ts">
	import { onMount } from 'svelte'

	type Game = 'waiting for input' | 'in progress' | 'game ended'

	let words = ''
	let wordIndex = 0
	let letterIndex = 0

	let game: Game = 'waiting for input'
	let seconds = 30
	let typedLetter = ''

	let wordsEl: HTMLDivElement
	let inputEl: HTMLInputElement
	let caretEl: HTMLDivElement

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			event.preventDefault()
			nextWord()
		}

		if (game === 'waiting for input') {
			startGame()
		}
	}

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
				setGameState('game ended')
			}
		}

		const interval = setInterval(gameTimer, 1000)
	}

	function moveCaret() {
		const { offsetTop, offsetLeft, offsetWidth } = currentLetterEl()
		const currentWordLength = words[wordIndex].length - 1
		const caretOffsetTop = 4

		if (letterIndex !== currentWordLength) {
			caretEl.style.left = `${offsetLeft}px`
			caretEl.style.top = `${offsetTop + caretOffsetTop}px`
		}

		if (letterIndex === currentWordLength) {
			caretEl.style.left = `${offsetLeft + offsetWidth}px`
		}
	}

	function checkLetter() {
		const currentLetter = words[wordIndex][letterIndex]
		const letterEl = currentLetterEl()

		if (typedLetter === currentLetter) {
			letterEl.classList.add('correct')
		}

		if (typedLetter !== currentLetter) {
			letterEl.classList.add('incorrect')
		}
	}

	function nextWord() {
		wordIndex += 1
		letterIndex = 0
		moveCaret()
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
		const thresholdY = 400

		if (wordPosition.y > thresholdY) {
			wordEl.scrollIntoView({ block: 'center' })
		}
	}

	function resetLetter() {
		typedLetter = ''
	}

	function updateGameState() {
		checkLetter()
		nextLetter()
		updateLine()
		resetLetter()
		moveCaret()
	}

	function currentWordEl() {
		return wordsEl.children[wordIndex]
	}

	function currentLetterEl() {
		return wordsEl.children[wordIndex].children[letterIndex] as HTMLSpanElement
	}

	async function getWords(limit: number) {
		const response = await fetch(`/api/words?limit=${limit}`)
		words = await response.json()
	}

	function focusInput() {
		inputEl.focus()
	}

	onMount(async () => {
		getWords(100)
		focusInput()
	})
</script>

<div class="game" data-state={game}>
	<input
		bind:this={inputEl}
		bind:value={typedLetter}
		on:input={updateGameState}
		on:keydown={handleKeydown}
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

<style>
	.game {
		position: relative;
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

	[data-state='in progress'] .time {
		opacity: 1;
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
	}

	.letter {
		opacity: 0.4;
		transition: all 0.3s ease;
	}

	.letter:global(.correct) {
		opacity: 0.8;
	}

	.letter:global(.incorrect) {
		color: tomato;
		opacity: 1;
	}

	input {
		position: absolute;
		opacity: 0;
	}

	.caret {
		position: absolute;
		height: 1.8rem;
		top: 0;
		left: 0;
		border-right: 1px solid tomato;
		animation: caret 1s infinite;
		transition: all 0.2s ease;
	}

	[data-state='in progress'] .caret {
		animation: none;
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
