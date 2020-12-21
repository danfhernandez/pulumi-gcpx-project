import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
// import { Project } from "pulumi-gcpx-project";
import { Project } from "../project"

const config = new pulumi.Config();
const billingAccount = config.require("billingAccount");

const project = new Project("my-project", {
    billingAccount: billingAccount,
    enabledServiceApis: ["compute.googleapis.com"]
});

const bucket = new gcp.storage.Bucket("bucket-test", {}, {
    provider: project.provider
});

// Export the DNS name of the bucket
export const bucketName = bucket.url;