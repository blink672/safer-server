[![Travis](https://img.shields.io/travis/blink672/safer-server.svg)]()
# Project Name

> An api to handle authentication, database storage, friend requests, and location data for safer-apk.

## Team

  - Kyle Bradford
  - Raphael Feliciano
  - Tiffany Lin
  - Dario Artega

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Roadmap](#roadmap)
1. [Contributing](#contributing)

## Usage

|Method|Route|Params|Params Example|Request Data|Response Data|
|:-:|---|---|---|---|---|
|GET|/api/friends|N/A|N/A|N/A|JSON array of objects|
|GET|/api/friends/:id|id = friends user_id in SQL| id = 12|N/A|JSON object|
|   |   |   |   |   |   |
|   |   |   |   |   |   |
|   |   |   |   |   |   |
|   |   |   |   |   |   |

## Requirements

- Node 7.6.x
- Mysql 14.14

## Development
1. run this command in terminal inside the db folder. This will set up the inital schema for mysql, assuming the user is root without a password.

```sh
mysql -u root < schema.sql
```

### Installing Dependencies

From within the root directory:

```sh
npm install
```

### Roadmap

View the project roadmap [here](https://docs.google.com/spreadsheets/d/1zswwIFLl2TnROUIvWz_xeiKi4R1QUJyWA1xDT4M54XY/edit?usp=sharing)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
