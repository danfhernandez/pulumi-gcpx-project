import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";

export class Project extends pulumi.ComponentResource {
    public readonly provider: gcp.Provider;
    public readonly projectId: pulumi.Output<string>;
    
    constructor(name: string, args: ProjectArgs, opts?: pulumi.CustomResourceOptions) {
        super("gcpx:organizations:Project", name, {}, opts);
        
        const projectStack = `${pulumi.getStack()}-${pulumi.getProject()}`
        
        const randomProjectId = new random.RandomString(`${projectStack}-random-id`, {
            length: 8,
            special: false,
            upper: false
        }, { parent: this });

        // Due to GCP restrictions the project id needs to be less than 30 chars
        const projectId = args.id ?? randomProjectId.result.apply(rpid => `${projectStack}-${rpid}`.substring(0,29));

        const myProject = new gcp.organizations.Project(projectStack, {
            projectId: projectId, 
            billingAccount: args.billingAccount,
            name: args.name ?? projectId
        }, { parent: this, deleteBeforeReplace: true });

        const projectProvider = new gcp.Provider(`${projectStack}-provider`, {
            project: myProject.id.apply(id => id.replace("projects/", ""))
        }, { parent: this });

        // Enable services if provided, eventually including an enum would be nice... 
        if (args.enabledServiceApis) {
            args.enabledServiceApis.forEach((service, index) => {
                let serviceApi = new gcp.projects.Service("service-"+index, {
                    service: service, 
                    disableOnDestroy: false
                }, {provider: projectProvider, parent: this})
            });
        }

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

    /**
     * Optional input for name
     */
    name?: pulumi.Input<string>;

    /**
     * Optional input for id
     */
    id?: pulumi.Input<string>;

    /**
     * Optional list of services to enable for project. I.e. compute.googleapis.com
     */
    enabledServiceApis?: pulumi.Input<string>[];
}