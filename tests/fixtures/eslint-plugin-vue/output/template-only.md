# Exit code
1

# stdout
```

  x vue-eslint(html-self-closing): Require self-closing on HTML elements (<div>).
   ,-[input/template-only.vue:2:32]
 1 | <template>
 2 |   <div v-html="'<b>Hello</b>'"></div>
   :                                ^^^^^^
 3 | </template>
   `----

  x vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
   ,-[input/template-only.vue:2:8]
 1 | <template>
 2 |   <div v-html="'<b>Hello</b>'"></div>
   :        ^^^^^^^^^^^^^^^^^^^^^^^
 3 | </template>
   `----

Found 0 warnings and 2 errors.
Finished in Xms on 1 file with 3 rules using 1 threads.
```

# stderr
```
```
