## Pulumi Component for GCP Projects
This simple component is designed to make creating gcp projects easier. In GCP it's good practice to have a project per application / component / environment combination. So having a GCP project per stack seems like a nice architecture to go for but manually creating projects seems less than ideal. 

Also even if you decide to write this code in your Pulumi project, you have to come up with unique names for a project id and create a provider so that you can actually deploy resources into that project. 

Both of which are handled by this component. 


Example Usage:
```
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { Project } from "pulumi-gcpx-project";

const config = new pulumi.Config();
const billingAccount = config.require("billingAccount");

const project = new Project("my-project", {
    billingAccount: billingAccount
});

const bucket = new gcp.storage.Bucket("bucket-test", {}, {
    provider: project.provider
});

// Export the DNS name of the bucket
export const bucketName = bucket.url;

```
