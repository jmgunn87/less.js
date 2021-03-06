(function (tree) {

tree.Rule = function (name, value, important, index, inline) {
    this.name = name;
    this.value = (value instanceof tree.Value) ? value : new(tree.Value)([value]);
    this.important = important ? ' ' + important.trim() : '';
    this.index = index;
    this.inline = inline || false;

    if (name.charAt(0) === '@') {
        this.variable = true;
    } else { this.variable = false }
};

tree.Rule.prototype.toCSS = function (env) {
    if (this.variable) { return "" }
    else {
        return this.name + (env.compress ? ':' : ': ') +
               this.value.toCSS(env) +
               this.important + (this.inline ? "" : ";");
    }
};

tree.Rule.prototype.eval = function (context) {
    // resolve a variable variable declaration
    if(this.name.charAt(1) === '@') {
        var refCount = this.name.match(/^@+/)[0].length;
        var resolvedName = this.name.substr(refCount-1);
        for(; refCount; --refCount){
           var refVar = context.frames[0].variables()[resolvedName];
           if(refVar){
               // if the referenced variable has been returned from the context's variables() function
               // from the contexts rule array choose option 2 in this ternary comparison.
               resolvedName = '@';
               resolvedName += refVar.value.value[0].value[0].value ?
                 refVar.value.value[0].value[0].value :
                 refVar.value.value[0].value;
           }
        }
        var newVariable = context.frames[0].variables()[this.name];
        context.frames[0].variables()[resolvedName] = newVariable;
        delete context.frames[0].variables()[this.name];
        context.frames[0].variables()[resolvedName].name = resolvedName;
        this.name = resolvedName;
    }
    return new(tree.Rule)(this.name,
                          this.value.eval(context),
                          this.important,
                          this.index, this.inline);
};

tree.Shorthand = function (a, b) {
    this.a = a;
    this.b = b;
};

tree.Shorthand.prototype = {
    toCSS: function (env) {
        return this.a.toCSS(env) + "/" + this.b.toCSS(env);
    },
    eval: function () { return this }
};

})(require('../tree'));
