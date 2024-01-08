<script>
  import { onMount, onDestroy } from 'svelte'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'

  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import Heading from '@tiptap/extension-heading'

  let element
  let editor

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        // Document,
        // Paragraph,
        // Text,
        // Heading.configure({
        //   levels: [1,2,3],
        // })
        StarterKit,
      ],
      content: '<p>Hello World! 🌍️ </p>',
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor
      },
    })
  })

  onDestroy(() => {
    if (editor) {
      editor.destroy()
    }
  })

  //editor => html
  //const html = editor.getHTML()

  //html => editor
  //editor.commands.setContent(`<p>Example Text</p>`)

</script>

{#if editor}
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 1}).run()}
    class:active={editor.isActive('heading', { level: 1 })}
  >
    H1
  </button>
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    class:active={editor.isActive('heading', { level: 2 })}
  >
    H2
  </button>
  <button on:click={() => editor.chain().focus().setParagraph().run()} class:active={editor.isActive('paragraph')}>
    P
  </button>
  <button on:click={() => editor.chain().focus().toggleBold().run()} class:active = {editor.isActive('bold')} >
    Bold
  </button>
  <button on:click={() => editor.chain().focus().toggleBold().run()} class:active = {editor.isActive({textAlign: 'right'})} >
    Right
  </button>
  <button on:click={() => editor.chain().focus().toggleUnderline().run()} class:active = {editor.isActive('underline')} >
    UnderLine
  </button>
{/if}

<div bind:this={element} />

<style>
  button.active {
    background: black;
    color: white;
  }
</style>