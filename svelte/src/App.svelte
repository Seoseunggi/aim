<script>
  import routes from "./routes/index";
  import Router from "svelte-spa-router";
  import Header from "./Header.svelte";
</script>

<Header />
<main>
  <Router {routes} />
</main>

<style>
</style>