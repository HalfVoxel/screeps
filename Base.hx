class Base implements Ref.HasID {
	public var type : TypeLookup;
	public var id : Int;
	public var linked : Entity;
	public var manager : AIManager;
	public var my : Bool;

	public function new () {}

	public function isStandalone () { return false; }

	public function initialize ( register = true ) {
		my = true;
		IDManager.initialize(this, register);
		onCreated();
	}

	public function tick () {}

	public function onCreated () {}
	public function onDestroyed () {}
}