
@:autoBuild(AutoBuildingMacro.fromBaseClass())
class Base implements Ref.HasID {
	public var type : TypeLookup;
	public var id : Int;
	public var linked : Entity;
	public var manager : AIManager;
	public var my : Bool;

	public function new () {
	}

	public function isStandalone () { return false; }

	public function initialize ( register = true ) {
		my = true;
		internalInitialize ();
		IDManager.initialize(this, register);
		onCreated();
		return this;
	}

	public function internalInitialize () {}

	public function tick () {}

	public function onCreated () {}
	public function onDestroyed () {}

	public static function instantiate<T:Base> (type : Class<T>) : T {
		var v = Type.createInstance (type, []);
		v.initialize(false);
		return v;
	}
}