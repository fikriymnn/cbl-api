const ReportWasteService = require("./service/reportWasteService");

const ReportWasterQc = {
  getReportWasteQc: async (req, res) => {
    const { start_date, end_date } = req.body;

    try {
      const result = await ReportWasteService.reportWasteQc({
        start_date,
        end_date,
      });

      if (!result.success) {
        return res.status(result.status).json({ msg: result.message });
      }

      return res.status(200).json(result.data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getReportWasteByJo: async (req, res) => {
    const { no_jo, id_jo } = req.body;

    try {
      const result = await ReportWasteService.reportWasteByJo({
        no_jo,
        id_jo,
      });

      if (!result.success) {
        return res.status(result.status).json(result);
      }

      return res.status(200).json(result.data);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = ReportWasterQc;
