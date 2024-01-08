<script>
  import { onMount } from "svelte";
  
  import EditorJS from '@editorjs/editorjs';
  import Header from '@editorjs/header';
  import CodeTool from '@editorjs/code';
  import SimpleImage from '@editorjs/image';
  
  export let isReadOnly = false;
  export let data = {};
  
  let editor;
  async function startEditor() {
    editor = new EditorJS({
      holder: 'editorjs',
      readOnly: isReadOnly,
      data: data,
      tools: {
        header: Header,
        image: SimpleImage,
        code: CodeTool,
      },      
      placeholder: 'Let`s write an awesome story!',
      data: {
        time: 1552744582955,
        blocks: [
          {
            type: "image",
            data: {
              url: "https://cdn.pixabay.com/photo/2017/09/01/21/53/blue-2705642_1280.jpg"
            }
          }
        ],
        version: "2.11.10"
      }
    });
  }
  
  onMount(startEditor);
  
  $: if (data && editor) {
    console.log("Editor - Update - Update: "
      + ("Updating editor with " + JSON.stringify(data)));
    
    editor.isReady.then(() => {
      editor.clear();
      editor.render(data);
    });
  }  
</script>

<div id="editorjs" class="editor"></div>

<style>
    .editor {
        margin-top: 1rem;
        border: 1px solid black;
        height: 500px;
    }
    
</style>