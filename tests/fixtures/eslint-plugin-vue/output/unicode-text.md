# Exit code
1

# stdout
```

  x vue-eslint(html-self-closing): Require self-closing on HTML elements (<span>).
   ,-[input/unicode-text.vue:6:37]
 5 | <template>
 6 |   <p>示例 🎉<span v-html="html"></span></p>
   :                                 ^^^^^^^
 7 | </template>
   `----

  x vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
   ,-[input/unicode-text.vue:6:23]
 5 | <template>
 6 |   <p>示例 🎉<span v-html="html"></span></p>
   :                   ^^^^^^^^^^^^^
 7 | </template>
   `----

  x vue-eslint(prefer-import-from-vue): Import from 'vue' instead of '@vue/runtime-core'.
   ,-[input/unicode-text.vue:2:49]
 1 | <script setup>
 2 | const html = '示例 🎉'; import { ref } from '@vue/runtime-core'
   :                                             ^^^^^^^^^^^^^^^^^^^
 3 | </script>
   `----

Found 0 warnings and 3 errors.
Finished in Xms on 1 file with 3 rules using 1 threads.
```

# stderr
```
```
