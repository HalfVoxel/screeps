interface HasID
{
    public var id : Int;	
}

abstract Ref<T:HasID> (Int) {

	inline function new (v : Int) {
		this = v;
	}

	@:from
	public static inline function fromBase(s : Base) : Ref<T> {
		return new Ref(s.id);
	}

	@:to
	public inline function toEntity() : T {
		return cast IDManager.byID(this);
	}

	@:op(A == B)
	public static function compT<T>(lhs : Ref<T>, rhs : T) : Bool {
		return untyped __js__("lhs == null ? (rhs == null) : (IDManager.byID(lhs) == rhs)");
	}

	@:op(A == B)
	public static function compRef<T>(lhs : Ref<T>, rhs : Ref<T>) : Bool {
		
		untyped __js__("
		var val1 = lhs != null ? IDManager.byID(lhs) : null;
		var val2 = rhs != null ? IDManager.byID(rhs) : null;");

		return untyped __js__("val1 == val2");
	}


	@:op(A != B)
	public static function ncompT<T>(lhs : Ref<T>, rhs : T) : Bool {
		return untyped __js__("lhs == null ? rhs != null : IDManager.byID(lhs) != rhs");
	}

	@:op(A != B)
	public static function ncompRef<T>(lhs : Ref<T>, rhs : Ref<T>) : Bool {
		untyped __js__("
		var val1 = lhs != null ? IDManager.byID(lhs) : null;
		var val2 = rhs != null ? IDManager.byID(rhs) : null;");
		return untyped __js__("val1 != val2");
	}
}