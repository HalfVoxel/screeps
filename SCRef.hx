abstract SCRef<T:HasStringID> (String) {

	public inline function new (v : String) {
		this = v;
	}

	@:from
	public static inline function fromEntity(s : T) : SCRef<T> {
		return new SCRef(s.id);
	}

	@:to
	public inline function toEntity() : T {
		return cast IDManager.bySCID(this);
	}

	@:op(A == B)
	public static inline function compT<T>(lhs : SCRef<T>, rhs : T) : Bool {
		return lhs.toEntity() == rhs;
	}

	@:op(A == B)
	public static inline function compRef<T>(lhs : SCRef<T>, rhs : SCRef<T>) : Bool {
		var val1 = lhs != null ? lhs.toEntity() : null;
		var val2 = rhs != null ? rhs.toEntity() : null;
		return val1 == val2;
	}
}