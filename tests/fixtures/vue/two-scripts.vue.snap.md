# Exit code
1

# stdout
```

  x mini(no-foo): Unexpected foo.
   ,-[two-scripts.vue:6:7]
 5 | <script setup>
 6 | const foo = 'Hello'
   :       ^^^
 7 | </script>
   `----

  x mini(no-marquee): Unexpected <marquee>.
    ,-[two-scripts.vue:10:3]
  9 | <template>
 10 |   <marquee>{{ foo }}</marquee>
    :   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 11 | </template>
    `----

Found 0 warnings and 2 errors.
Finished in Xms on 1 file with 2 rules using 1 threads.
```

# stderr
```
```
