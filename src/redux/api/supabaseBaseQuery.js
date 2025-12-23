import { supabase } from "@/lib/supabaseClient";

/**
 * Custom base query for RTK Query using Supabase
 * Supports pagination, filtering, and CRUD operations
 */
export const supabaseBaseQuery = async (args, api, extraOptions) => {
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
    let query = supabase.from(table);

    // Apply joins if needed (for related data)
    if (joins.length > 0) {
      // Supabase joins syntax: "foreign_table!inner(column1,column2)"
      // إذا كان select هو "*"، نستخدمه مباشرة مع الـ joins
      // وإلا نضيف الـ joins للـ select المحدد
      const selectWithJoins =
        select === "*"
          ? `${select},${joins.join(",")}`
          : `${select},${joins.join(",")}`;
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

    let result;
    // تحديد select string للاستخدام في POST/PUT
    const selectString =
      joins.length > 0
        ? select === "*"
          ? `${select},${joins.join(",")}`
          : `${select},${joins.join(",")}`
        : select;

    switch (method) {
      case "GET":
        if (id) {
          result = await query.eq("id", id).single();
        } else {
          result = await query;
        }
        break;
      case "POST":
        result = await query.insert(body).select(selectString).single();
        break;
      case "PUT":
        result = await query.update(body).eq("id", id).select(selectString).single();
        break;
      case "PATCH":
        result = await query.update(body).eq("id", id).select(selectString).single();
        break;
      case "DELETE":
        result = await query.delete().eq("id", id);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (result.error) {
      // معالجة أخطاء Supabase بشكل أفضل
      const errorMessage =
        result.error.message || "حدث خطأ أثناء تنفيذ العملية";
      
      // إذا كان الخطأ 406، قد يكون بسبب مشكلة في الـ headers أو الـ session
      if (result.error.code === "PGRST116" || result.error.status === 406) {
        return {
          error: {
            status: "NOT_ACCEPTABLE",
            data: result.error,
            message: "خطأ في تنسيق الطلب. يرجى المحاولة مرة أخرى",
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
    if (errorMessage.includes("match") || errorMessage.includes("undefined")) {
      return {
        error: {
          status: "CLIENT_ERROR",
          data: error,
          message: "خطأ في إعدادات الاتصال. يرجى تحديث الصفحة",
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

