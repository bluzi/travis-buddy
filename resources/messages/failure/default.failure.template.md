## Travis tests have failed

Hey @{{pullRequestAuthor}},
Please read the following log in order to understand the failure reason.
It'll be awesome if you fix what's wrong and commit the changes.

{{#jobs}}

### {{displayName}}

<a href="{{link}}">View build log</a>

{{#scripts}}

<details>
  <summary>
    <strong>
     {{command}}
    </strong>
  </summary>

```
{{&contents}}
```

</details>

{{/scripts}}
{{/jobs}}
