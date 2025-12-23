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
    let query = supabase.from(table);

    // Apply joins if needed (for related data)
    if (joins.length > 0) {
      // Supabase joins syntax: "foreign_table!inner(column1,column2)"
      const selectWithJoins = `${select}, ${joins.join(", ")}`;
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
    switch (method) {
      case "GET":
        if (id) {
          result = await query.eq("id", id).single();
        } else {
          result = await query;
        }
        break;
      case "POST":
        result = await query.insert(body).select().single();
        break;
      case "PUT":
        result = await query.update(body).eq("id", id).select().single();
        break;
      case "PATCH":
        result = await query.update(body).eq("id", id).select().single();
        break;
      case "DELETE":
        result = await query.delete().eq("id", id);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (result.error) {
      return {
        error: {
          status: "CUSTOM_ERROR",
          data: result.error,
          message: result.error.message,
        },
      };
    }

    return { data: result.data };
  } catch (error) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        data: error,
        message: error.message || "An error occurred",
      },
    };
  }
};

