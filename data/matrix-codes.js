/* EXPOSE matrix status codes, transcribed without modification from
 * OVERVIEW DATABASE 3.0-2.xlsx / "irene is working here".
 * Each of the 69 rows has V6–V104 (99 fields), in workbook row order.
 * 0 = not found/not used, 1 = found/used, 9 = no information available.
 * Values are packed as two-bit codes: 0=>0, 1=>1, 9=>2.
 */
window.EXPOSE_CODE_STATUS=(function(){
  "use strict";
  var ids=["1.1","1.2","2.1","2.2","3.1","3.2","3.3","3.4","3.5","4.1","4.2","4.3","4.4","4.5","4.6","4.7","4.8","5.1","5.2","5.3","6.1","6.2","6.3","6.4","6.5","7.1","8.1","8.2","8.3","8.4","8.5","8.6","9.1","9.2","10.1","10.2","11.1","11.2","11.3","11.4","12.1","12.2","12.3","12.4","12.5","13.1","14.1","14.2","14.3","14.4","14.5","14.6","14.7","14.8","14.9","15.1","15.2","15.3","15.4","15.5","16.1","16.2","16.3","16.4","17.1","17.2","17.3","18.1","18.2"];
  var packed="pqqqqqqqqqqqqaqqaqqqVkVAUQABBAEVkJqqqqqqqqqqKqqqqpqqqgUAUABAAEAAAKSqqqqqqqqqqpqqqqqiqipBAAAEAEEAAACopqqqqqqqqqqmqqqqqapaVRFFBUVUAFFApaqqqqqqqqqqqaqqaqqqVgRAAAAAAAAAUKmqqqqqqqqqSqqqqZqqqhVBUAAAAEAAAFSqqqqqqqqqqpKqqqqmqmpFBRQABAAQQECVqqqqKqqqqqKlKqiqqapaEAEAAQQABABApaqqqpqaqqpqqVqqaqqqVkRAVRAFAUFEUKKpqqqqqqqqKpWqqoqqqhURUEUUAAQEAZRpqqqqqqqqqlqlqqqmqmpVFVAVBUAQQABlmqqqqqqqqqpWqaqqqKpaFQFRVQEQRBBAmWZqqmqqqqqmBaqqZKqqVkUBBEAEFQEAEKJZWqqKqqaqYYCqAolCqkURAAEUQQUQAIAolhIqoqqoahigqECikGJRFEAURVAABABkiqWIkkQoqhoWKCCAKaRYFAEQQBEEAAEAmWYYICQQGqCGFQoZZFppVUVQRFEFBUFAkZqqqqqqqqqqqqqqqqqqqhUQEBBAAUBAAGCmqqqqqqqqqpqqqqqmqmoVBEQAEAAQEACoqaqqqqqqqqqmqqqqqapaUQEBBARQBFQAqqqqqqqqqqoqqqqiqqqqAgAAAAAAAAAAgKaqqqqqKqqqSqqqqCqoqgUQEBBAAAAAAKSYqqqqqoqqqpqqKqoGqmpRVAQRFBBAAECppqqqqqqqqqqmqqqqqapaEAEBAAQAAEBQqqmqqqqqpqqqqaaqaqqqVhVUEUFBQBEQlKqqqqqqqqqqaqqqqpqqqlURAFAAAEAAAGSqqqqqqqqqqoqqqqqqqmpFBBQAAQAAQACZqqqqqqqqqqqiqqqqqqpaURFVRQVAAFFQpqmqqqqqqqqqqKqqaqqqVkVEAEEBEAAVkBmmqqqqqqqqKqqqqpqqqlUREFVEAUBQEWSGqaqqqqqqqpqqqqqmqmpFAEQQEQAQUAGpoaqqqqqqqqqmqqqqqKpaERABAQQAAEFAqqqqqqqqqqqqqaqqaqqqFgAAQAAABAAAkKmqqqqqqqqqaqqqqpqqqhUBEBBAAEEAAaSmqqqqqqqqqoqqqqqqqmoAAAAAAAAAAACYqqqqqqqqqqqmqqqqqapaFQFFAAQABFBAaqqqqqqaqqqqqKqqqqqqVgRAAAAAAAAAkJqqqqqqpqqiKqqqqKKooBUBUAAAAAAAAKSmaqqqqqmqqJqqKqgoKmhFBBQQAAAAAACpqZqqqmqqqqqmqhoqmkpaFQEFFQUABBBAoqqqqqqKqqqqqKqqqqqKAgAAAAAAAAAAgIiqqqqqqqqqKqqqqoqqogAAAAAAAAAAAKCiqqqqqqqqqoqqqqqmqioAAAAAAAAAAACpqZqqqqqqqqqiqqqqqKpaFAEBAQQAABRAKqqiqqqqqqqqqKqqKqqqAgAAAAAAAAAAgGqqqqqqqqqqaqqqqpqqqlUUFVRAAEAABKWqqqqqqqqqqhqgqqqqqmoAAAAAAAAAAACgqqqqqqqqqqpGqKqqqqpaAAAEAAAAAAAAqaqqqqqqqqqqEaqqKqqqVgBAAQAAAAAAUKKqqqqqqqqqahWqqoqqqlVRUBUQQAQAAJSoqqqqqqqqqlqBqqqmqmpVABQQAAAAAAAhqqqqqqqqqqoCoKqqqKoKAAAAAAAAAAAAqqqqqqqqqqqqqKqqqqqqAgAAAAAAAAAAgKqqqqqqqqqqqqqqqqqqqgAAAAAAAAAAAKCqqqqqqqqqqqqqqqqqqioAAAAAAAAAAACIqqqqqqqqqqqqqqqqqqoKAAAAAAAAAAAApqqiqqqqqqqqqqqqKqqKQgBAAAAAAAAAgKmqqKKqqqqqqqqqqpqqohAAEAAAAAAAAGSqaqqpqqqqqpqqqqqmqmpVRAQUBFAVAACZqYoqqqqqqqqmqqqqqapaFQURAUVUBUAQpqqqqqqqqqqqqKqqKqqqVkUAQQBAAAEFlKmqqaqqqqqqaqqqqoqqqlUREBRAEEBABWWqKqqqqqqqqoqqqqqmqmpVBAAEAAQQAECZqoqqqqqqqqqmqqqqqapaFQFABQQBBARQqqmqqqqqqqqqqaqqKqqqBgAAAAAAAAAAgImqqqqqqqqqaqqqqoqqqhEBEABBAAAABGSiqqqqqqqqqpqqqqqiqmpFBAQAEAAAAQFlpqqqqqqqqqqmqqqqqKpaEQEBBAAAABAAmamqqqqqqiqqqaqqKqqqVgVEEAEBEAAEEA==";
  var bytes=atob(packed), values={};
  ids.forEach(function(id,row){
    var record={};
    for(var col=0;col<99;col++){
      var offset=row*99+col;
      var bit=(bytes.charCodeAt(offset>>2)>>((offset&3)*2))&3;
      record["V"+(col+6)]=bit===2?9:bit;
    }
    values[id]=record;
  });
  return {episodeCodes:values,source:'OVERVIEW DATABASE 3.0-2.xlsx / irene is working here',cutoff:'31 December 2025'};
})();
