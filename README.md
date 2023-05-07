# Casement: a logical, minimalistic iFrame communication library
---

## Introduction
Plenty of people have tried to build iFrame comms libraries before. Most of them are too complicated, too heavy, or too opinionated. Casement is a simple, lightweight library that provides a simple API for sending messages between a parent window and an iFrame. The better terminology for this library is the 'inside' and 'outside,' though. From either side, you send a message, and you can get a promise back with the response if you so choose.

## Installation
Casement is available on NPM. You can install it with `npm install casement`.

## Why does it exist?
So many iFrame comms libraries don't take into account my use case. This isn't for everyone, as its intended purpose is to help a sandboxed app within an iFrame communicate with a container window with access to a larger API. Most other use cases are handled by [Postmate](https://github.com/dollarshaveclub/postmate). 