// This isn't really a js file, but syntax highlighting can be cool if you pretend it is.
// Lines that start with a '#' are comments and are ignored.
// lines that begin '```' (3 back ticks in a row) denote sections and are followed imediately by the section name.
// If the section begins and ends with " then it is a constant, otherwise it's a template.  Both templates and constants can contain newlines without escaping.

```errors.missingPromise

"You must provide a promise to await."

```errors.tooManyPromises

"You can't await more than one promise at a time."

```errors.unresolvedJoin

"Promise must be resolved before you join them."

```useStackTrace

{
    try 
        {{src}} 
    catch (ex) { 
        if (typeof {{prefix}}stack === "object") {
            {{prefix}}rethrow(ex, {{prefix}}stack) 
        } else {
            throw ex;
        } 
    }
}

```addStackTrace

{{prefix}}stack.lineno = {{line}};{{src}}


```awaitResult

{{prefix}}awaitResults[{{id}}]

```innerStepFunction

{
    var {{prefix}}lastStep;
    var {{prefix}}stuck = 0;
    {{vars}}
    return function {{name}}({{prefix}}currentStep, {{prefix}}err, {{prefix}}awaitResults) {
        while ({{prefix}}stuck < 10) {
            if({{prefix}}lastStep === {{prefix}}currentStep) {
                {{prefix}}stuck++;
            } else {
                {{prefix}}lastStep = {{prefix}}currentStep
                {{prefix}}stuck = 0;
            }
            switch ({{prefix}}currentStep) { 
                case 0:
                    {{source}}
                    return;
            }
        }
    }
}