<script lang="ts">
	type State = Record<string, Record<string, Progress>>
	type Letter = Record<string, Progress>
	type Progress = null | 'correct' | 'incorrect'

	let words = 'The quick brown fox jumps over the lazy dog'.split(' ')
	let game = setGameState(words)
	let currentWordIndex = 0
	let currentWord = words[currentWordIndex]
	let userInput = ''

	$: updateGameState(userInput)

	function setGameState(words: string[]) {
		function wordsReducer(state: State, word: string) {
			const letters: Letter = {}

			for (const letter of [...word]) {
				letters[letter] = null
			}

			return {
				...state,
				[word]: letters,
			}
		}

		return words.reduce(wordsReducer, {})
	}

	function updateGameState(userInput: string) {
		let current = [...currentWord]
		let input = [...userInput]

		for (let i = 0; i < currentWord.length; i++) {
			const currentLetter = currentWord[i]

			if (current[i] === input[i]) {
				game[currentWord][currentLetter] = 'correct'
			}

			if (current[i] !== input[i]) {
				game[currentWord][currentLetter] = 'incorrect'
			}

			if (!input[i]) {
				game[currentWord][currentLetter] = null
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			event.preventDefault()
			if (currentWordIndex === words.length - 1) return
			currentWordIndex += 1
			currentWord = words[currentWordIndex]
			userInput = ''
		}
	}
</script>

<h1>Sveltetype</h1>

<div class="words">
	{#each words as word}
		<span class="word">
			{#each word as letter, i}
				{@const correct = game[word][letter] === 'correct'}
				{@const incorrect = game[word][letter] === 'incorrect'}
				{@const isCurrentWord = currentWord === word}
				{@const isCurrentLetter = userInput.length - 1 === i}
				{@const isWordStart = userInput.length === 0 && i === 0}
				{@const caret = isCurrentWord && (isWordStart || isCurrentLetter)}

				<span class="letter" class:caret class:correct class:incorrect>
					{letter}
				</span>
			{/each}
		</span>
	{/each}
</div>

<input bind:value={userInput} on:keydown={handleKeydown} type="text" />

<style>
	.words {
		font-size: 2rem;
	}

	.letter {
		position: relative;
		opacity: 0.4;
		transition: all 0.3s ease;
	}

	.letter.correct {
		opacity: 1;
	}

	.letter.incorrect {
		color: tomato;
		opacity: 1;
	}

	.letter.caret::after {
		content: ' ';
		width: 2px;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		background-color: orangered;
		animation: caret 1s infinite;
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
