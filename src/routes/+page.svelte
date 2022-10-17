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
			wordIndex += 1
			letterIndex = 0
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
			if (seconds === 0) {
				clearInterval(interval)
				setGameState('game ended')
			}

			seconds -= 1
		}

		const interval = setInterval(gameTimer, 1000)
	}

	function moveCaret() {
		const { offsetTop, offsetLeft, offsetWidth } = currentLetterEl()

		caretEl.style.left = `${offsetLeft + offsetWidth}px`
		caretEl.style.top = `${offsetTop}px`
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

	function nextLetter() {
		const currentWordLength = words[wordIndex].length - 1

		if (letterIndex < currentWordLength) {
			letterIndex += 1
		}
	}

	function updateLine() {
		const wordEl = currentWordEl()
		const wordPosition = wordEl.getBoundingClientRect()
		const thresholdY = 440

		if (wordPosition.y > thresholdY) {
			wordEl.scrollIntoView({ block: 'center' })
		}
	}

	function resetLetter() {
		typedLetter = ''
	}

	function updateGameState() {
		moveCaret()
		checkLetter()
		nextLetter()
		updateLine()
		resetLetter()
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
		setGameState('waiting for input')
		getWords(100)
		focusInput()
	})
</script>

<div class="time" style:opacity={game === 'in progress' ? 1 : 0}>
	{seconds}
</div>

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

<input
	bind:this={inputEl}
	bind:value={typedLetter}
	on:input={updateGameState}
	on:keydown={handleKeydown}
	type="text"
/>

<style>
	.time {
		margin-bottom: 0.8rem;
		font-family: 'Roboto Mono', monospace;
		font-size: 1.5rem;
		color: tomato;
		opacity: 0;
		transition: all 0.3s ease;
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
		border-right: 1px solid tomato;
		animation: caret 1s infinite;
		transition: all 0.3s ease;
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
