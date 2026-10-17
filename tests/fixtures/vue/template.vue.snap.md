# Exit code
1

# stdout
```

  x mini(no-foo): Unexpected foo.
   ,-[template.vue:2:7]
 1 | <script setup>
 2 | const foo = 'Hello'
   :       ^^^
 3 | </script>
   `----

  x mini(no-marquee): Unexpected <marquee>.
   ,-[template.vue:6:3]
 5 | <template>
 6 |   <marquee>{{ foo }}</marquee>
   :   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 7 | </template>
   `----

Found 0 warnings and 2 errors.
Finished in Xms on 1 file with 2 rules using 1 threads.
```

# stderr
```
```
