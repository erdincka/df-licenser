# Ezmeral Data Fabric Storage Capacity Sizing

This utility is provided without any warranty or commitment. This is not an official sizing tool.

It is designed to help with selecting the right amount of disks/capacities to help with infrastructure requirements.

## Guidance

Provide usable capacity that is required. No compression is taken into account in the sizing.
You may choose to use Erasure Coded Warm tier for max 70% of usable capacity, and the EC schema to be used.

Expert mode - enabled via the link on the header provides detailed options to be selected.

You may (should) use the official [EPA Sizer tool](https://solutionsizers.ext.hpe.com/EPASizer/) for advanced and fine-tuned sizing for HPE Data Fabric (and HPE Runtime Enterprise and HPE MLOps platforms).

Tool will automatically calculate how many nodes and how many disks per tier per node should be used.

You may select different disk sizes to optimize utilisation.

Provided recommendation is for minimum capacities that should be used in a production environment. More resources will be needed for advacned features, such as running additional EEP (Ezmeral Ecosystem Pack) components.

## Old SKU mode - this feature is retired as no longer valid to purchase

You may contact your HPE representative if you require assistance on this.

### These are archived as these SKUs are no longer available

Calculate how many compute unit (CU) licenses you need with given server configurations.

Currently beta, needs testing/verification.

## This is a personal project and in no way endorsed by HPE product management

Feel free to open requests/issues.

Erdinc Kaya
