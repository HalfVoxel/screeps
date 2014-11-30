class Base implements Ref.HasID {
	public var type : TypeLookup;
	public var id : Int;
	public var linked : Entity;
	public var manager : AIManager;
	public var my : Bool;

	public function new () {}

	function initialize () {
		my = true;
		IDManager.initialize(this);
		onCreated();
	}

	public function tick () {}

	public function onCreated () {}
	public function onDestroyed () {}
}