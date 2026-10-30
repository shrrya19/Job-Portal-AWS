import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Edit2,
  MoreHorizontal,
  Building2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector(
    (store) => store.company
  );

  const [filterCompany, setFilterCompany] = useState(companies);

  const navigate = useNavigate();

  useEffect(() => {
    const filteredCompany =
      companies?.filter((company) => {
        if (!searchCompanyByText) return true;

        return company?.name
          ?.toLowerCase()
          .includes(searchCompanyByText.toLowerCase());
      }) || [];

    setFilterCompany(filteredCompany);
  }, [companies, searchCompanyByText]);

  if (filterCompany.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-16 text-center">

        <Building2
          size={50}
          className="mx-auto text-[#6A38C2]"
        />

        <h2 className="text-2xl font-bold mt-4">
          No Companies Found
        </h2>

        <p className="text-gray-500 mt-2">
          Create your first company to get started.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">

      <Table>

        <TableCaption className="py-4">
          Registered Companies List
        </TableCaption>

        <TableHeader>

          <TableRow className="bg-purple-50">

            <TableHead className="text-[#6A38C2] font-semibold">
              Logo
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Company Name
            </TableHead>

            <TableHead className="text-[#6A38C2] font-semibold">
              Created Date
            </TableHead>

            <TableHead className="text-right text-[#6A38C2] font-semibold">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {filterCompany.map((company, index) => (
            <motion.tr
              key={company._id}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              className="hover:bg-purple-50/50 transition-all"
            >
              <TableCell>

                <Avatar className="h-12 w-12 border shadow-sm">
                  <AvatarImage src={company.logo} />
                </Avatar>

              </TableCell>

              <TableCell className="font-semibold">
                {company.name}
              </TableCell>

              <TableCell>
                {company.createdAt.split("T")[0]}
              </TableCell>

              <TableCell className="text-right">

                <Popover>

                  <PopoverTrigger>
                    <MoreHorizontal className="cursor-pointer" />
                  </PopoverTrigger>

                  <PopoverContent className="w-36">

                    <div
                      onClick={() =>
                        navigate(
                          `/admin/companies/${company._id}`
                        )
                      }
                      className="flex items-center gap-2 cursor-pointer hover:text-[#6A38C2]"
                    >
                      <Edit2 size={16} />
                      <span>Edit Company</span>
                    </div>

                  </PopoverContent>

                </Popover>

              </TableCell>

            </motion.tr>
          ))}

        </TableBody>

      </Table>

    </div>
  );
};

export default CompaniesTable;