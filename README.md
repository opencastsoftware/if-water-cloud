# if-water-cloud

![MIT License](https://img.shields.io/badge/license-MIT-brightgreen)

## Overview
An IF plugin for calculating the water consumption by datacentres which currently uses a defaul WUE of 1.8l/kWh. Uses published WUE figures for cloud vendors if supplied.

## Usage

To run the plugin, you must first create an instance of `water-cloud`. Then, you can call `execute()`.

```javascript
const { WaterCloud } = require('./index.js');

const waterCloudPlugin = WaterCloud({});

const inputs = [
    { energy: 10 },
    { energy: 15 }
];

const result = waterCloudPlugin.execute(inputs, {});

console.log(result);
```

You can run the below example by saving it as `./examples/water-cloud.yml` and executing the following command from the project root:

```sh
npm run build
npm link if-water-cloud
if-run --manifest ./examples/water-cloud.yml --output ./examples/outputs/water-cloud.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`

## Global Config

Not required.

## Input Parameters

- `energy`: energy used. (kWh)
- `cloud/vendor`: (Optional) Name of cloud vendor. Supported values are AWS, Azure, GCP.
- `cloud/region`: (Optional) Worldwide region. Currently only Azure breaks down WUE by region
- `wue` : (Optional) If you have your own wue figures this will override any defaults

## Error Handling
Throws an exception if energy is not a number
Throws an exception if cloud/vendor is supplied but is not a string.
Throws an exception if cloud/region is provided but is not a string

## Returns

- `water-cloud`: the amount of water used.

## Plugin Algorithm

 WUE is calculated as follows (if no region is supplied for Azure then it will default to worldwide figure):

| Provider | Region              | WUE          | Source |
|----------|---------------------|--------------|---------|
| -        | -                   | 1.8          |[Datacentredynamics.com](https://www.datacenterdynamics.com/en/opinions/an-industry-in-transition-1-data-center-water-use/)|
| AWS      | -                   | 0.18         |[AWS Sustainability Report](https://sustainability.aboutamazon.com/2023-report)|
| Azure    | -                   | 0.49         |[How microsoft measures datacentre water use](https://azure.microsoft.com/en-us/blog/how-microsoft-measures-datacenter-water-and-energy-use-to-improve-azure-cloud-sustainability/)|
| Azure    | Americas            | 0.55         |[How microsoft measures datacentre water use](https://azure.microsoft.com/en-us/blog/how-microsoft-measures-datacenter-water-and-energy-use-to-improve-azure-cloud-sustainability/)|
| Azure    | Asia Pacific        | 1.65         |[How microsoft measures datacentre water use](https://azure.microsoft.com/en-us/blog/how-microsoft-measures-datacenter-water-and-energy-use-to-improve-azure-cloud-sustainability/)|
| Azure    | EMEA                | 0.10         |[How microsoft measures datacentre water use](https://azure.microsoft.com/en-us/blog/how-microsoft-measures-datacenter-water-and-energy-use-to-improve-azure-cloud-sustainability/)|
| GCP      | -                   | 1.10         |[New Scientist (estimation)](https://www.newscientist.com/article/2354801-google-has-finally-revealed-how-much-water-its-data-centres-use/)|

You can override this behaviour by providing your own WUE figure (for instance for your own datacentre or private cloud provider). If no figure is supplied and vendor/region are not matched then the plugin will fall back to the 1.8l/kWh average estimated for US datacentres.

## Example manifest

```yaml
name: water-cloud manifest
description: example impl invoking water cloud plugin
tags:
initialize:
  plugins:
    water-cloud:
      method: WaterCloud
      path: 'if-water-cloud'
      global-config:
        keep-exisiting: true
tree:
  pipeline:
    compute:
      - water-cloud
  config:
    water-cloud:
  inputs:
    - timestamp: 2024-04-01T00:00 
      duration: 100
      energy: 10
    - timestamp: 2024-04-01T00:00 
      duration: 200
      energy: 20
      wue: 1.2
    - timestamp: 2024-04-01T00:00 
      duration: 300
      energy: 30
      cloud/vendor: Azure
      cloud/region: Asia Pacific

```

Example outputs:

```yaml
  outputs:
    - timestamp: 2024-04-01T00:00
      duration: 100
      energy: 10
      water-cloud: 18
    - timestamp: 2024-04-01T00:00
      duration: 200
      energy: 20
      water-cloud: 36
    - timestamp: 2024-04-01T00:00
      duration: 300
      energy: 30
      water-cloud: 54
```

## Licence
 
The MIT License (MIT)

Copyright (c) 2024 OPENCAST SOFTWARE EUROPE LIMITED

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
