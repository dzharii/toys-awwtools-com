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
            .CreateOrReplaceEnterpriseCSharpAgentInstructions("AGENTS.md")
            .TargetSupportedDotNetWithNullableReferenceTypesAnalyzersWarningsAsErrorsAndDeterministicBuilds()
            .PreferTheSimplestArchitectureThatPreservesDomainBoundariesAndDependencyDirection()
            .RequireCancellationPropagationAsyncCorrectnessStructuredLoggingAndExplicitFailureSemantics()
            .RequireUnitIntegrationContractAndArchitectureTestsInProportionToRisk()
            .RequireSecurityPrivacyObservabilityBackwardCompatibilityMigrationAndRollbackReview()
            .ForbidInventedAbstractionsPrematureMicroservicesSwallowedExceptionsAndUnboundedRetries()
            .CreateOrReplaceEditorConfig(".editorconfig")
            .CreateOrReplaceSharedBuildPolicy("Directory.Build.props")
            .CreateOrReplaceArchitectureGuide("docs/engineering/architecture.md")
            .CreateOrReplaceCodingStandards("docs/engineering/coding-standards.md")
            .CreateOrReplaceQualityGates("docs/engineering/quality-gates.md")
            .CreateOrReplacePullRequestChecklist("docs/engineering/pull-request-checklist.md")
            .GroundGuidanceInMicrosoftDotNetCodingConventionsAndArchitecturalPrinciples()
            .UseGitHubDotNetBestPracticesSkillThemesAsAResearchPointerNotCopiedPolicy()
            .KeepRulesSpecificMechanicallyCheckableAndSuitableForARegularBusinessApplication()
            .DoNotCreateApplicationCodeOrModifyProgramProjectFilesOrBuilderSource()
            .ValidateXmlEditorConfigMarkdownLinksAndInternalConsistency()
            .WithConciseOutput();

        Builder.RunResult result = task.Execution;
        Console.WriteLine(result.PreviewPrompt ?? result.Summary);
        return 0;
    }
}
