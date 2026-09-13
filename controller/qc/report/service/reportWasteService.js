const BarangRusakV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const BarangRusakPointV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const BarangRusakDefectV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");
const Rabut = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutModel");
const RabutPoint = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const RabutDefect = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const AmparLem = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemModel");
const AmparLemPoint = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const AmparLemDefect = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");
const User = require("../../../../model/userModel");
const Ticket = require("../../../../model/maintenaceTicketModel");
const ProsesMtc = require("../../../../model/mtc/prosesMtc");
const ProduksiLkh = require("../../../../model/produksi/produksiLkhModel");
const ProduksiLkhWaste = require("../../../../model/produksi/produksiLkhWasteModel");
const MasterKodeProduksi = require("../../../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterMesinTahapan = require("../../../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterKategoriKendala = require("../../../../model/masterData/kodeProduksi/masterKategoriKendalaModel");

const ReportWasteService = {
  reportWasteByJo: async ({ no_jo, id_jo }) => {
    if (!no_jo || !id_jo) {
      return {
        status: 400,
        success: false,
        message: "no_jo dan id_jo wajib diisi",
      };
    }

    try {
      const [
        dataTiketMaintenance,
        dataBarangRS,
        dataRabut,
        dataAmparLem,
        dataKendalaLkh,
      ] = await Promise.all([
        Ticket.findAll({
          attributes: [
            "no_jo",
            "operator",
            "kode_lkh",
            "nama_kendala",
            "mesin",
            "createdAt",
            "kode_ticket",
          ],
          include: [
            {
              model: ProsesMtc,
              attributes: ["waktu_selesai"],
              include: [
                {
                  model: User,
                  as: "user_eksekutor",
                  attributes: ["nama"],
                },
                {
                  model: User,
                  as: "user_qc",
                  attributes: ["nama"],
                },
              ],
            },
          ],
          where: { no_jo },
        }),
        BarangRusakV2.findAll({
          where: { no_jo, status: "history" },
          include: [
            {
              model: BarangRusakDefectV2,
              as: "inspeksi_barang_rusak_defect_v2",
              include: [
                {
                  model: BarangRusakPointV2,
                  as: "inspeksi_barang_rusak_point_v2",
                  include: [{ model: User, as: "inspektor" }],
                },
              ],
            },
          ],
        }),
        Rabut.findAll({
          where: { no_jo, status: "history" },
          include: [
            {
              model: RabutDefect,
              as: "inspeksi_defect",
              include: [
                {
                  model: RabutPoint,
                  as: "inspeksi_rabut_point",
                  include: [{ model: User, as: "inspektor" }],
                },
              ],
            },
          ],
        }),
        AmparLem.findAll({
          where: { no_jo, status: "history" },
          include: [
            {
              model: AmparLemDefect,
              as: "inspeksi_defect",
              include: [
                {
                  model: AmparLemPoint,
                  as: "inspeksi_ampar_lem_point",
                  include: [{ model: User, as: "inspektor" }],
                },
              ],
            },
          ],
        }),
        ProduksiLkhWaste.findAll({
          where: { id_jo },
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
              attributes: ["no_jo", "no_io", "customer", "produk", "id_jo"],
            },
            { model: User, as: "operator", attributes: ["nama"] },
            {
              model: MasterMesinTahapan,
              as: "mesin",
              attributes: ["nama_mesin"],
            },
            {
              model: MasterKodeProduksi,
              as: "kendala",
              attributes: ["id"],
              include: [
                {
                  model: MasterKategoriKendala,
                  as: "kategori_kendala",
                  attributes: ["kategori"],
                },
              ],
            },
          ],
        }),
      ]);

      return {
        status: 200,
        success: true,
        data: {
          dataTiketMaintenance,
          dataBarangRS,
          dataRabut,
          dataAmparLem,
          dataKendalaLkh,
        },
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },
};

module.exports = ReportWasteService;
