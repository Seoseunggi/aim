<script>
  import { content } from "./store"
</script>

<p>{$content}</p>

<input bind:value={$content} />

