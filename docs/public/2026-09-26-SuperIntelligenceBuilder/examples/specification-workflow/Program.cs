using System;

using Builder = SuperIntelligenceBuilder;

internal static class Program
{
    private static int Main(string[] args)
    {
        try { return Run(args); }
        catch (Builder.BuilderException ex)
        {
            Console.Error.WriteLine($"{ex.Message}\nClassification: {ex.Error}");
            return 1;
        }
        catch (OperationCanceledException)
        {
            Console.Error.WriteLine("A formal invitation to retire was received; partial edits may remain.");
            return 130;
        }
    }

    private static int Run(string[] args)
    {
        var preview = args.Length == 1 && args[0] == "--preview";
        var proceed = args.Length == 1 && args[0] == "--yes,please,proceed";
        if (args.Length > (preview || proceed ? 1 : 0))
        {
            Console.Error.WriteLine("Pardon me, but the accepted form is: dotnet run [-- --yes,please,proceed|--preview]");
            return 2;
        }

        var options = new Builder.Options
        {
            Agent = Builder.AgentKind.Codex,
            Preview = preview,
            Proceed = proceed,
            Timeout = TimeSpan.FromMinutes(10)
        };

        dynamic task = Builder.WithFile("AGENTS.md", options)
            .CreateOrReplaceAgentInstructionsForSpecificationDrivenDevelopment("AGENTS.md")
            .BaseTheWorkflowOnConsumerVisibleBehaviorBeforeImplementationDetails()
            .RequireExplicitScopeNonGoalsAssumptionsEdgeCasesAcceptanceCriteriaAndOpenQuestions()
            .RequireTraceabilityFromRequirementsToPlanToVerificationTasks()
            .CreateOrReplaceProjectConstitution(".specify/memory/constitution.md")
            .CreateOrReplaceSpecificationIndex("specifications/README.md")
            .WriteProductSpecification(
                "specifications/csv-task-import/spec.md",
                "Add bulk CSV import to a small-team task tracker. A signed-in project editor selects a UTF-8 CSV up to 5 MiB with title, assignee_email, and due_date columns; reviews row-level validation; then imports all valid rows atomically or imports nothing. Duplicate detection, permissions, keyboard access, recovery, observability, privacy, and measurable acceptance criteria must be covered. Keep this document implementation-free.")
            .WriteTechnicalPlan(
                "specifications/csv-task-import/plan.md",
                "Derive a modest implementation plan from the product specification. Record architecture boundaries, data flow, validation strategy, security risks, rollout and rollback, telemetry, testing layers, and requirement-to-design traceability without inventing a framework or cloud vendor.")
            .WriteDependencyOrderedTasks(
                "specifications/csv-task-import/tasks.md",
                "Create reviewable tasks with stable IDs, dependencies, deliverables, and verification. Every acceptance criterion must map to at least one task and test. Do not implement the feature.")
            .CiteTheResearchSourcesAlreadyNamedInTheProgramWithoutCopyingTheirText()
            .UseGitHubSpecKitStyleConstitutionSpecifyPlanTasksSeparation()
            .UseWarpWriteProductSpecStyleSeparationOfProductBehaviorFromTechnicalPlanning()
            .DoNotModifyProgramProjectFilesOrBuilderSource()
            .ValidateMarkdownLinksAndCrossArtifactTraceability()
            .WithConciseOutput();

        Builder.RunResult result = task.Execution;
        Console.WriteLine(result.PreviewPrompt ?? result.Summary);
        return 0;
    }
}
