# Exit code
1

# stdout
```

  x vue-eslint(html-self-closing): Require self-closing on HTML elements (<div>).
   ,-[input/with-bom.vue:8:22]
 7 | <template>
 8 |   <div v-html="html"></div>
   :                      ^^^^^^
 9 | </template>
   `----

  x vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
   ,-[input/with-bom.vue:8:8]
 7 | <template>
 8 |   <div v-html="html"></div>
   :        ^^^^^^^^^^^^^
 9 | </template>
   `----

  x vue-eslint(prefer-import-from-vue): Import from 'vue' instead of '@vue/runtime-core'.
   ,-[input/with-bom.vue:2:21]
 1 | ﻿<script setup>
 2 | import { ref } from '@vue/runtime-core'
   :                     ^^^^^^^^^^^^^^^^^^^
 3 | 
   `----

Found 0 warnings and 3 errors.
Finished in Xms on 1 file with 3 rules using 1 threads.
```

# stderr
```
```
