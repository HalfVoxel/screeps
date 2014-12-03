import haxe.macro.Context;
import haxe.macro.Expr;

class AutoBuildingMacro {
	macro static public
	function fromInterface():Array<Field> {
		trace("fromInterface: "
			+ Context.getLocalType());
		return null;
	}

	macro static public
	function fromBaseClass():Array<Field> {
		/*trace("fromBaseClass: "
			+ Context.getLocalType());
		
		var pos = haxe.macro.Context.currentPos();
		var fields = haxe.macro.Context.getBuildFields();

		var expr = EReturn(null);
		var func = {args:[],ret:null,params:[], expr:{expr:expr, pos:pos} };

		fields.push({ name : "extraMethod", doc : null, meta : [], access : [AOverride], kind : FFun(func), pos : pos });

		return fields;*/

		var type = Context.getLocalType();
		var name = "nothing";

		switch(type) {
			case TInst(t, params): name = t.get().name;
			default: trace(type);
		}

		//var c2 = Context.parseInlineString("macro : {override function extraMethod () { type = " + stuff + ";}}", Context.currentPos());

		var c = macro : {
			override function internalInitialize () {
				type = $i{name};
			}
		};
		switch (c) {
			case TAnonymous(fields):
				return Context.getBuildFields().concat(fields);
			default:
				throw 'unreachable';
		}
	}

    /*macro static public function build():Array<Field> {

        //stuff();

        var fields = Context.getBuildFields();
        var newField : haxe.macro.Field = {
          name: "Stuffs",
          doc: null,
          meta: [{pos:Context.currentPos(), name:":impl"},{pos:Context.currentPos(), name:":enum"}],
          access: [AStatic, APublic],
          kind: FVar(macro : String,
            macro "mydefault"),
          pos: Context.currentPos()
        };
        fields.push(newField);
        return fields;
    }

    static function makeEnumField(name, kind) {
        return {
            name: name,
            doc: null,
            meta: [],
            access: [],
            kind: kind,
            pos: Context.currentPos()
        }
    }*/
}