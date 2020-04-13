// 判断是不是纯对象，而非构造函数
export default function isPlainObject(obj) {
    if(typeof obj != 'object' || obj === null) {
        return false;
    }
    let proto = obj;
    // 取到obj最终_proto_指向
    while(Objext.getPrototypeOf(proto)) {
        proto = Object.getPrototypeOf(proto)
    }
    return Object.getPrototypeOf(obj) === proto;
}
