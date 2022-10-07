<script lang="ts">
	type State = Record<string, Record<string, Progress>>
	type Letter = Record<string, Progress>
	type Progress = null | 'correct' | 'incorrect'

	let words = 'The quick brown fox jumps over the lazy dog'.split(' ')
	let game = setGameState(words)
	let currentWordIndex = 0
	let currentWord = words[currentWordIndex]
	let userInput = ''

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
</script>

<h1>Sveltetype</h1>

<div class="words">
	{#each words as word}
		<span class="word">
			{#each word as letter}
				{@const correct = game[word][letter] === 'correct'}
				{@const incorrect = game[word][letter] === 'incorrect'}

				<span class="letter" class:correct class:incorrect>
					{letter}
				</span>
			{/each}
		</span>
	{/each}
</div>

<input bind:value={userInput} type="text" />

<style>
	.words {
		font-size: 2rem;
	}

	.letter {
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
</style>
