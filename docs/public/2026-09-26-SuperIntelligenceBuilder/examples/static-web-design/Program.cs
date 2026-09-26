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
            .CreateOrReplaceAgentInstructionsForSmallStaticWebsiteDesign("AGENTS.md")
            .RequireAVisualThesisContentPlanAndInteractionThesisBeforeImplementation()
            .RequireThreeDistinctDesignDirectionsAndAReasonedSelectionAgainstTheBrief()
            .PreferSubjectSpecificTypographyCompositionColorTextureAndMotionOverGenericSaaSCards()
            .RequireSemanticHtmlKeyboardAccessVisibleFocusSufficientContrastResponsiveLayoutAndReducedMotion()
            .TreatMobileEmptyErrorLongContentAndNoJavaScriptStatesAsDesignedStates()
            .CreateOrReplaceDesignBrief(
                "design/brief.md",
                "Design a one-page site for Juniper Street Repair Cafe, a volunteer neighborhood event where residents bring lamps, toys, clothing, and small appliances for help repairing them. The page must communicate the next event, accepted items, how the process works, accessibility details, and a mailto volunteer call to action. It must work as a local static site with no build step or remote dependencies.")
            .CreateOrReplaceThreeDirectionComparison("design/directions.md")
            .CreateOrReplaceChosenDesignDecision("design/decision.md")
            .CreateOrReplaceDesignSystem("design/system.md")
            .CreateOrReplaceReviewChecklist("design/review-checklist.md")
            .BuildTheChosenDirectionAs("site/index.html", "site/style.css", "site/script.js")
            .UseOnlyLocalSemanticHtmlCssAndProgressiveJavaScript()
            .KeepThePrimaryEventInformationAvailableWithoutJavaScript()
            .UseAnthropicFrontendDesignIdeasForDistinctiveArtDirection()
            .UseVercelWebInterfaceGuidelinesForAccessibilityAndInteractionReview()
            .DoNotCopyThirdPartySkillTextOrModifyProgramProjectFilesOrBuilderSource()
            .ValidateHtmlCssJavaScriptLocalLinksAndResponsiveBehaviorAsFarAsAvailableToolsAllow()
            .WithConciseOutput();

        Builder.RunResult result = task.Execution;
        Console.WriteLine(result.PreviewPrompt ?? result.Summary);
        return 0;
    }
}
