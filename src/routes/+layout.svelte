<script lang="ts">
	import '../app.css'
</script>

<svelte:head>
	<title>Sveltype</title>
</svelte:head>

<div class="layout">
	<nav>
		<h1>🔥 sveltype</h1>
	</nav>

	<main>
		<slot />
	</main>
</div>

<style>
	h1 {
		padding: 2rem 0;
		font-size: 1.8rem;
		color: tomato;
		letter-spacing: 1px;
	}

	.layout {
		height: 100%;
		display: grid;
		grid-template-rows: repeat(2, 1fr);
	}

	main {
		margin-inline: auto;
	}
</style>
