import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";

export class Project extends pulumi.ComponentResource {
    public readonly provider: gcp.Provider;
    public readonly projectId;
    
    constructor(name, args: ProjectArgs, opts?) {
        super("gcpx:organizations:Project", name, {}, opts);
        const projectStack = `${pulumi.getStack()}-${pulumi.getProject()}`

        const randomProjectId = new random.RandomString(`${projectStack}-random-id`, {
            length: 8,
            special: false,
            upper: false
        }, { parent: this });
        
        const projectId = pulumi.interpolate`${projectStack}-${randomProjectId.result}`;

        const myProject = new gcp.organizations.Project(projectStack, {
            projectId: projectId,
            billingAccount: args.billingAccount
        }, { parent: this, deleteBeforeReplace: true });

        const projectProvider = new gcp.Provider(`${projectStack}-provider`, {
            project: myProject.id.apply(id => id.replace("projects/", ""))
        }, { parent: this });

        this.provider = projectProvider;
        this.projectId = myProject.id;

        this.registerOutputs({
            provider: this.provider,
            projectId: this.projectId
        });
    }
}

export interface ProjectArgs {
    /**
     * A required id for billing on project
     */
    billingAccount: pulumi.Input<string>;
}