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

try {
    var {{prefix}}stack = { input: {{prefix}}substack.input, filename: {{prefix}}substack.filename};
    {{src}} 
} catch (ex) { 
    if (typeof {{prefix}}stack === "object") {
        {{prefix}}rethrow(ex, {{prefix}}stack) 
    } else {
        throw ex;
    } 
}

```useStackTraceFunction
{
    {{> useStackTrace}}
}

```addStackTrace

{{prefix}}stack.lineno = {{line}};
{{src}};


```awaitResult

{{prefix}}awaitResults[{{id}}]

```innerStepFunction

{
    var {{prefix}}args = arguments;
    var {{prefix}}lastStep;
    var {{prefix}}stuck = 0;
    {{vars}}
    return {{prefix}}async(function ({{prefix}}currentStep, {{prefix}}err, {{prefix}}awaitResults) {
        arguments = {{prefix}}args;
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
    });
}

```withStatement
        {{prefix}}currentStep = {{innerStep}};
}
with ({{object}}) {
    switch ({{prefix}}currentStep) {
        case {{innerStep}}:
            {{body}}
            {{prefix}}currentStep = {{continueStep}};
            break;
    }
}
switch ({{prefix}}currentStep) {
    case {{continueStep}}:

```await
    
    {{prefix}}args = arguments;
    return yield({{source}}, {{id}}, {{stepID}});
case {{stepID}}:
    if({{prefix}}err) { throw {{prefix}}err; }



```test
{{#needsToResolve}}
    return yield({{source}}, {{id}}, {{stepID}});
case {{stepID}}:
    if({{prefix}}err) { throw {{prefix}}err; }
{{/needsToResolve}}
    if ({{test}}) {
        {{prefix}}currentStep = {{consequentStep}};
    } else {
        {{prefix}}currentStep = {{alternateStep}};
    }
    break;

```ifElseStatement

{{> test}}
case {{consequentStep}}:
    {{consequent}}
    {{prefix}}currentStep = {{continueStep}};
    break;
case {{alternateStep}}:
    {{alternate}}
    {{prefix}}currentStep = {{continueStep}};
    break;
case {{continueStep}}:

```whileStatement

    {{prefix}}currentStep = {{testStep}};
    break;
case {{testStep}}:
{{> test}}
    break;
case {{consequentStep}}:
    {{body}}
    {{prefix}}currentStep = {{testStep}}
    break;
case {{alternateStep}}: {{! the alternate is to continue}}


```forStatement

    {{init}}
    {{prefix}}currentStep = {{testStep}};
    break;
case {{testStep}}:
{{> test}}
    break;
case {{incrementStep}}:
{{#needsToResolveUpdate}}
    return yield({{source}}, {{id}}, {{stepID}});
case {{stepID}}:
    if({{prefix}}err) { throw {{prefix}}err; }
{{/needsToResolveUpdate}}
    {{increment}}
    {{prefix}}currentStep = {{testStep}};
    break;
case {{consequentStep}}:
    {{body}}
    {{prefix}}currentStep = {{incrementStep}};
    break;
case {{alternateStep}}: {{! the alternate is to continue}}


```tryStatement
        {{prefix}}currentStep = {{innerStep}};
}
try {
    switch ({{prefix}}currentStep) {
        case {{innerStep}}:
            {{body}}
            {{prefix}}currentStep = {{continueStep}};
            break;
    }
}{{catches}}
switch ({{prefix}}currentStep) {
    case {{continueStep}}: