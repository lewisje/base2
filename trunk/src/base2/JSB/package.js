
// JavaScript Behaviors

var JSB = new base2.Package(this, {
  name:    "JSB",
  version: "0.9.1",
  imports: "Function2,Enumerable,DOM",
  exports: "Behavior,Rule,RuleList,ExtendedMouse"
});

eval(this.imports);
