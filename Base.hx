
@:autoBuild(AutoBuildingMacro.fromBaseClass())
class Base implements Ref.HasID {
	public var type : TypeLookup = TypeLookup.AICreep;
	public var id : Int = 0;
	public var linked : Entity = null;
	public var manager : AIManager = null;
	public var my : Bool = false;

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

	public function earlyTick () {}
	
	public static function instantiate<T:Base> (type : Class<T>) : T {
		var v = Type.createInstance (type, []);
		v.initialize(false);
		return v;
	}

	public function destroy () {
		IDManager.destroy (this);
	}
}