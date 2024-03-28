# cnfair

## Installation

### Using NPM *(recommended)*

#### 1. Installing Node.JS

Install the latest version of [Node.JS](https://nodejs.org/en)

#### 2. Installing the CLI

Run the following command:

``npm i -g cnfair-cli``

### Manual installation

#### 1. Installing Node.JS

Install the latest version of [Node.JS](https://nodejs.org/en)

#### 2. Installing Bun

Install the latest version of [Bun](https://bun.sh/)

#### 3. Installing dependencies

Run the following command:

``bun install --production --frozen-lockfile``

#### 4. Build the CLI

Run the following command:

``bun run build``

#### 5. Link the CLI

Run the following command:

``bun link``

## Usage

To use the CLI run the following command:

``cnfair --help``

### Commands

#### *token [token]*

Allows to set the pandabuy token used to redeem the products

You can find out your current token by running this in a browser tab currently logged into pandabuy:

```javascript
token = localStorage.getItem("PANDABUY_TOKEN");
console.log(token || "ERROR: Pandabuy token not found")
```

#### *redeem [options] <productIds...>*

Recovers the redeem code for every specified productId on CNFair and then redeem them on Pandabuy.

Product ids often look like this: ``PI0000000000`` and can be found in the URL of a CNFair product, example:
``https://cnfair.com/detail/PI0000000000``

##### Options

| flag                     | description                                                 | Default |
|--------------------------|-------------------------------------------------------------|---------|
| -r --restock             | Enable restock mode                                         | false   |
| -d, --delay <amount>     | Delay between each attempts in seconds                      | 5       |
| --restock-delay <amount> | Delay between each attempts in seconds when in restock mode | 10      |
| -w --way                 | Payment method (choices: "points", "balance")               | points  |