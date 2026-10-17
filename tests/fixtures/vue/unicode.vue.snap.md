# Exit code
1

# stdout
```

  x mini(no-foo): Unexpected foo.
   ,-[unicode.vue:2:32]
 1 | <script setup>
 2 | const a = "示例 🎉"; const foo = 1
   :                            ^^^
 3 | </script>
   `----

  x mini(no-marquee): Unexpected <marquee>.
   ,-[unicode.vue:6:17]
 5 | <template>
 6 |   <p>示例 🎉<marquee /></p>
   :             ^^^^^^^^^^^
 7 | </template>
   `----

Found 0 warnings and 2 errors.
Finished in Xms on 1 file with 2 rules using 1 threads.
```

# stderr
```
```
