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

## Updating

To update the CLI you can simply run the following command:

```npm i -g cnfair-cli```

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
| -r, --restock            | Enable restock mode                                         | false   |
| -d, --delay <amount>     | Delay between each attempts in seconds                      | 5       |
| --restock-delay <amount> | Delay between each attempts in seconds when in restock mode | 10      |
| -w, --way                | Payment method (choices: "points", "balance")               | points  |

### Examples

Redeem a single product:
``cnfair redeem PI00000001``

Redeem two products:
``cnfair redeem PI00000001 PI00000002``

Redeem two products and pay with balance:
``cnfair redeem -w balance PI00000001 PI00000002``

Redeem a product with a retry delay of 1s:
``cnfair redeem -d 1 PI00000001``

Monitor a product for restock:
``cnfair redeem -r PI00000001``

Monitor a product for restock every 20s:
``cnfair redeem -r --restock-delay 20 PI00000001``

Redeem 3 products with a delay of 1s, enable restock monitoring with a delay of 20s and pay with balance:
``cnfair redeem -d 1 -r --restock-delay 20 -w balance PI00000001 PI00000002 PI00000003``

