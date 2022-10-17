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
		font-size: 1.8rem;
		color: hsl(220 20% 80%);
		letter-spacing: 1px;
	}

	.layout {
		height: 100%;
		display: grid;
		grid-template-rows: auto 1fr;
		align-items: center;
		padding: 2rem;
	}
</style>
