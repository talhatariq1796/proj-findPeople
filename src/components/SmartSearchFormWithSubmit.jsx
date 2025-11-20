import withFormSubmit from "../hoc/withFormSubmit";
import SmartSearchForm from "./SmartSearchForm";
import DynamicTable from "./DynamicTable";

const FormWithTable = ({ apiResponse, loading, loadingMore, error, onLoadMore, hasMore, ...formProps }) => {
  return (
    <>
      <SmartSearchForm {...formProps} />
      {(apiResponse || loading || error) && (
        <DynamicTable
          data={apiResponse}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
        />
      )}
    </>
  );
};

const SmartSearchFormWithSubmit = withFormSubmit(FormWithTable);

export default SmartSearchFormWithSubmit;
