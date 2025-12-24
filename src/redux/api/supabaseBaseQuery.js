import { supabase } from "@/lib/supabaseClient";

/**
 * Custom base query for RTK Query using Supabase
 * Supports pagination, filtering, and CRUD operations
 */
export const supabaseBaseQuery = async (args) => {
  const {
    table,
    method = "GET",
    id,
    body,
    filters = {},
    pagination = {},
    orderBy = { column: "created_at", ascending: false },
    select = "*",
    joins = [],
  } = args;

  try {
    // Supabase يتعامل مع الجلسة تلقائياً
    // لا نضيف قيود إضافية هنا لأن RLS policies في Supabase تتعامل مع الأمان
    let result;

    // التحقق من أن Supabase client موجود
    if (!supabase) {
      throw new Error("Supabase client is not initialized");
    }

    // تحديد select string للاستخدام في الاستعلامات
    let selectString = select;
    if (joins.length > 0) {
      if (select === "*") {
        selectString = `${select},${joins.join(",")}`;
      } else {
        selectString = `${select},${joins.join(",")}`;
      }
    }

    switch (method) {
      case "GET": {
        // نبني استعلام القراءة بشكل منفصل حتى لا نؤثر على عمليات الكتابة (insert / update)
        let query = supabase.from(table);

        // Apply joins if needed (for related data)
        if (joins.length > 0) {
          // Supabase joins syntax: "foreign_table!inner(column1,column2)"
          // بناء select string بشكل صحيح - Supabase يتطلب تنسيق محدد
          let selectWithJoins;
          if (select === "*") {
            // إذا كان select = "*", نضيف joins بعدها مباشرة بدون فاصلة إضافية
            selectWithJoins = `*,${joins.join(",")}`;
          } else {
            // إذا كان select محدد، نضيف joins بعد الحقول المحددة
            selectWithJoins = `${select},${joins.join(",")}`;
          }
          
          // استخدام select بدون options إضافية لتجنب مشاكل 406
          query = query.select(selectWithJoins);
        } else {
          query = query.select(select);
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === "object" && value.operator) {
              // Support for operators like gt, lt, gte, lte, like, ilike
              switch (value.operator) {
                case "gt":
                  query = query.gt(key, value.value);
                  break;
                case "lt":
                  query = query.lt(key, value.value);
                  break;
                case "gte":
                  query = query.gte(key, value.value);
                  break;
                case "lte":
                  query = query.lte(key, value.value);
                  break;
                case "like":
                  query = query.like(key, value.value);
                  break;
                case "ilike":
                  query = query.ilike(key, value.value);
                  break;
                default:
                  query = query.eq(key, value.value);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        });

        // Apply ordering
        if (orderBy.column) {
          query = query.order(orderBy.column, {
            ascending: orderBy.ascending !== false,
          });
        }

        // Apply pagination
        if (pagination.page && pagination.pageSize) {
          const from = (pagination.page - 1) * pagination.pageSize;
          const to = from + pagination.pageSize - 1;
          query = query.range(from, to);
        }

        if (id) {
          result = await query.eq("id", id).single();
        } else {
          result = await query;
        }
        break;
      }
      case "POST":
        // في Supabase، نستخدم from(table).insert() مباشرة بدون select مسبق
        result = await supabase
          .from(table)
          .insert(body)
          .select(selectString)
          .single();
        break;
      case "PUT":
      case "PATCH":
        // update لا يجب أن يكون بعد select، لذا نبدأ استعلامًا جديدًا
        result = await supabase
          .from(table)
          .update(body)
          .eq("id", id)
          .select(selectString)
          .single();
        break;
      case "DELETE":
        result = await supabase.from(table).delete().eq("id", id);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (result.error) {
      // معالجة أخطاء Supabase بشكل أفضل
      const errorMessage =
        result.error.message || "حدث خطأ أثناء تنفيذ العملية";
      
      // إذا كان الخطأ 406، قد يكون بسبب مشكلة في الـ headers أو الـ session أو الـ select query
      if (result.error.code === "PGRST116" || result.error.status === 406 || result.error.code === "PGRST301") {
        console.error("Supabase 406 error:", {
          table,
          selectString,
          joins,
          error: result.error
        });
        
        // محاولة إعادة المحاولة بدون joins إذا فشلت
        if (joins.length > 0 && method === "GET") {
          try {
            const simpleQuery = supabase.from(table).select(select === "*" ? "*" : select);
            
            // تطبيق الفلاتر
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                if (Array.isArray(value)) {
                  simpleQuery.in(key, value);
                } else if (typeof value === "object" && value.operator) {
                  switch (value.operator) {
                    case "gt": simpleQuery.gt(key, value.value); break;
                    case "lt": simpleQuery.lt(key, value.value); break;
                    case "gte": simpleQuery.gte(key, value.value); break;
                    case "lte": simpleQuery.lte(key, value.value); break;
                    case "like": simpleQuery.like(key, value.value); break;
                    case "ilike": simpleQuery.ilike(key, value.value); break;
                    default: simpleQuery.eq(key, value.value);
                  }
                } else {
                  simpleQuery.eq(key, value);
                }
              }
            });
            
            if (id) {
              const simpleResult = await simpleQuery.eq("id", id).single();
              if (!simpleResult.error) {
                console.warn(`Supabase query with joins failed (406), returned data without joins for table: ${table}`);
                return { data: simpleResult.data };
              }
            } else {
              // تطبيق pagination
              if (pagination.page && pagination.pageSize) {
                const from = (pagination.page - 1) * pagination.pageSize;
                const to = from + pagination.pageSize - 1;
                simpleQuery.range(from, to);
              }
              
              // تطبيق ordering
              if (orderBy.column) {
                simpleQuery.order(orderBy.column, {
                  ascending: orderBy.ascending !== false,
                });
              }
              
              const simpleResult = await simpleQuery;
              if (!simpleResult.error) {
                console.warn(`Supabase query with joins failed (406), returned data without joins for table: ${table}`);
                return { data: simpleResult.data };
              }
            }
          } catch (retryError) {
            console.error("Error retrying query without joins:", retryError);
          }
        }
        
        return {
          error: {
            status: "NOT_ACCEPTABLE",
            data: result.error,
            message: "خطأ في تنسيق الطلب (406). قد تكون هناك مشكلة في الصلاحيات (RLS) أو في تنسيق الاستعلام. تحقق من RLS policies في Supabase.",
          },
        };
      }

      return {
        error: {
          status: "CUSTOM_ERROR",
          data: result.error,
          message: errorMessage,
        },
      };
    }

    return { data: result.data };
  } catch (error) {
    // معالجة الأخطاء العامة
    const errorMessage =
      error?.message || error?.toString() || "حدث خطأ غير متوقع";
    
    // إذا كان الخطأ يتعلق بـ undefined.match، فهذا يعني مشكلة في Supabase client
    if (errorMessage.includes("match") || errorMessage.includes("undefined") || error?.message?.includes("match")) {
      console.error("Supabase client error:", error);
      return {
        error: {
          status: "CLIENT_ERROR",
          data: error,
          message: "خطأ في إعدادات الاتصال. يرجى التحقق من إعدادات Supabase وتحديث الصفحة",
        },
      };
    }

    return {
      error: {
        status: "CUSTOM_ERROR",
        data: error,
        message: errorMessage,
      },
    };
  }
};

