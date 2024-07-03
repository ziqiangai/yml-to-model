# openapi-to-model

[English](./README.md) | 简体中文

> TS 的静态类型检查，让我们在前端进行数据请求的时候，需要明确定义响应的相应数据结构，这时，前端需要重新定义一份在后端已经定义过的 数据结构 ，一旦后端发生一点改变不及时通知，前后端就会造成不统一的情况。这时前后端就必须保持两者的一致性，一个修改另一个必须时刻保持同步，同时还要维护不同语言的相同代码。

直接基于 openapi 文档进行生成 types，完美解决了这个问题。 相比起基于 Java class 或者 Golang struct 的生成更加方便快捷。而且现在很多库都可以直接集成 openapi 生成文档，可以说适用性更高。

所以，我写了这个 cli 工具。

目前支持两种语言

- java
- typescript

```shell
npm install openapi-to-model

yml-to-model yml ./schema/user.yml
```

