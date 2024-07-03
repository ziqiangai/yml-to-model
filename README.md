# openapi-to-model

> Static type checking in TypeScript requires us to clearly define response data structures when making data requests in frontend applications. Often, frontend developers end up redefining data structures already defined on the backend. Any slight change made on the backend without timely notification can lead to inconsistencies between frontend and backend. Thus, maintaining consistency between both ends becomes crucial, requiring constant synchronization between them and the upkeep of identical codebases across different languages.

This CLI tool directly generates types based on OpenAPI documents, effectively solving this problem. It's more convenient and faster compared to generating from Java classes or Golang structs. Moreover, many libraries now integrate directly with OpenAPI to generate documentation, enhancing its versatility.

Therefore, I created this CLI tool.

Currently, it supports two languages:

- Java
- TypeScript

```shell
npm install openapi-to-model

yml-to-model yml ./schema/user.yml
```

--- 

Let me know if there's anything you'd like to adjust or if you need further assistance!
