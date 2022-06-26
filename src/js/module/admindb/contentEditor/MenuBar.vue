<template>
  <div>
    <template v-for="(item, index) in items">
      <div class="divider" v-if="item.type === 'divider'" :key="`divider${index}`"></div>
      <menu-item v-else :key="index" v-bind="item"></menu-item>
    </template>

    <ImageModal v-if="imageModal" @image="setImage"></ImageModal>
  </div>
</template>

<script>

import MenuItem from './MenuItem.vue';
import ImageModal from './ImageModal.vue';

export default {
  components: {
    MenuItem, ImageModal,
  },

  props: {
    editor: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      imageModal: false,

      items: [
        {
          icon: 'arrow-go-back-line',
          title: 'Undo',
          action: () => this.editor.chain().focus().undo().run(),
        },
        {
          icon: 'arrow-go-forward-line',
          title: 'Redo',
          action: () => this.editor.chain().focus().redo().run(),
        },
        { type: 'divider' },
        {
          icon: 'bold',
          title: 'Bold',
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive('bold'),
        },
        {
          icon: 'italic',
          title: 'Italic',
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive('italic'),
        },
        {
          icon: 'strikethrough',
          title: 'Strike',
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive('strike'),
        },
        {
          icon: 'code-view',
          title: 'Code',
          action: () => this.editor.chain().focus().toggleCode().run(),
          isActive: () => this.editor.isActive('code'),
        },
        {
          icon: 'font-color',
          title: 'Color',
          action: e => this.editor.chain().focus().setColor(e.target.value).run(),
          isActive: () => {},
        },
        {
          icon: 'terminal-box-fill',
          title: 'Background-color',
          action: e => this.editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run(),
          isActive: () => this.editor.isActive('highlight', { color: '#ffc078' }),
        },
        { type: 'divider' },
        {
          icon: 'align-left',
          title: 'Left',
          action: () => this.editor.chain().focus().setTextAlign('left').run(),
          isActive: () => this.editor.isActive({ textAlign: 'left' }),
        },
        {
          icon: 'align-center',
          title: 'Center',
          action: () => this.editor.chain().focus().setTextAlign('center').run(),
          isActive: () => this.editor.isActive({ textAlign: 'center' }),
        },
        {
          icon: 'align-right',
          title: 'Right',
          action: () => this.editor.chain().focus().setTextAlign('right').run(),
          isActive: () => this.editor.isActive({ textAlign: 'right' }),
        },
        { type: 'divider' },
        {
          icon: 'h-1',
          title: 'Heading 1',
          action: () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 1 }),
        },
        {
          icon: 'h-2',
          title: 'Heading 2',
          action: () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 2 }),
        },
        {
          icon: 'paragraph',
          title: 'Paragraph',
          action: () => this.editor.chain().focus().setParagraph().run(),
          isActive: () => this.editor.isActive('paragraph'),
        },
        {
          icon: 'list-unordered',
          title: 'Bullet List',
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive('bulletList'),
        },
        {
          icon: 'list-ordered',
          title: 'Ordered List',
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive('orderedList'),
        },
        /*{
          icon: 'list-check-2',
          title: 'Task List',
          action: () => this.editor.chain().focus().toggleTaskList().run(),
          isActive: () => this.editor.isActive('taskList'),
        },*/
        {
          icon: 'code-box-line',
          title: 'Code Block',
          action: () => this.editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => this.editor.isActive('codeBlock'),
        },
        { type: 'divider' },
        {
          icon: 'double-quotes-l',
          title: 'Blockquote',
          action: () => this.editor.chain().focus().toggleBlockquote().run(),
          isActive: () => this.editor.isActive('blockquote'),
        },
        {
          icon: 'separator',
          title: 'Horizontal Rule',
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        { type: 'divider' },
        {
          icon: 'text-wrap',
          title: 'Hard Break',
          action: () => this.editor.chain().focus().setHardBreak().run(),
        },
        {
          icon: 'link',
          title: 'Set Link',
          action: () => {
            const url = window.prompt('URL')

            if (url) {
              this.editor.chain().focus().setImage({ src: url }).run()
            }
          },
          isActive: () => this.editor.isActive('link'),
        },
        {
          icon: 'link-unlink',
          title: 'Remove Link',
          action: () => this.editor.chain().focus().unsetLink().run(),
        },
        { type: 'divider' },
        {
          icon: 'image-fill',
          title: 'Set Image',
          action: () => this.imageModal = true,
        },
      ],
    }
  },
  methods: {
    setImage(src) {
      this.editor.chain().focus().setImage({ src }).run();
      this.imageModal = false;
    },
  },
}
</script>

<style lang="scss">
.divider {
  width: 2px;
  height: 1.25rem;
  background-color: rgba(#000, 0.1);
  margin-left: 0.5rem;
  margin-right: 0.75rem;
}
</style>
